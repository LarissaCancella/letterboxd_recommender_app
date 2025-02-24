from fastapi import FastAPI, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from typing import Union
from urllib.parse import urlparse, urlunparse
import pandas as pd
from rq import Queue
from rq.exceptions import NoSuchJobError
from rq.job import Job
from rq.registry import DeferredJobRegistry

from worker import conn
from jobs.handle_recs import get_client_user_data, build_client_model

# Definir constantes
#REDIRECT_URL = "https://letterboxd-recommender-app.com"
ORIGINS = [
    "http://localhost",
    "https://localhost",
    "http://localhost:3000",
    "https://localhost:3000",
]

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações de arquivos estáticos e templates
#app.mount("/static", StaticFiles(directory="static"), name="static")
#templates = Jinja2Templates(directory="templates")

# Filas Redis e thresholds
queue_pool = [Queue(channel, connection=conn) for channel in ["high", "default", "low"]]
popularity_thresholds_500k_samples = [2500, 2000, 1500, 1000, 700, 400, 250, 150]


#@app.get("/", response_class=HTMLResponse)
#def homepage():
    # Redirecionar para URL principal
    #return RedirectResponse(REDIRECT_URL)


@app.get("/get_recs")
def get_recs(username: str, training_data_size: int, popularity_filter: int, data_opt_in: bool):
    # Validar filtro de popularidade
    popularity_threshold = (
        popularity_thresholds_500k_samples[popularity_filter]
        if 0 <= popularity_filter < len(popularity_thresholds_500k_samples)
        else None
    )
    
    num_items = 1400

    # Obter fila com menor carga de trabalho
    ordered_queues = sorted(queue_pool, key=lambda queue: DeferredJobRegistry(queue=queue).count)
    q = ordered_queues[0]

    # Adicionar trabalhos na fila
    job_get_user_data = q.enqueue(
        get_client_user_data,
        args=(username, data_opt_in),
        description=f"Scraping user data for {username} (sample: {training_data_size}, popularity_filter: {popularity_threshold}, data_opt_in: {data_opt_in})",
        result_ttl=45,
        ttl=200,
    )
    
    job_build_model = q.enqueue(
        build_client_model,
        args=(username, training_data_size, popularity_threshold, num_items),
        depends_on=job_get_user_data,
        description=f"Building model for {username} (sample: {training_data_size}, popularity_filter: {popularity_threshold})",
        result_ttl=30,
        ttl=200,
    )

    # Retornar IDs dos trabalhos
    return JSONResponse(
        {
            "redis_get_user_data_job_id": job_get_user_data.get_id(),
            "redis_build_model_job_id": job_build_model.get_id(),
        }
    )


@app.get("/results")
def get_results(redis_build_model_job_id: str, redis_get_user_data_job_id: str):
    # Preparar dicionário com IDs dos trabalhos
    job_ids = {
        "redis_build_model_job_id": redis_build_model_job_id,
        "redis_get_user_data_job_id": redis_get_user_data_job_id,
    }

    # Consultar status dos trabalhos
    job_statuses = {}
    for key, job_id in job_ids.items():
        try:
            job_statuses[key.replace("_id", "_status")] = Job.fetch(job_id, connection=conn).get_status()
        except NoSuchJobError:
            job_statuses[key.replace("_id", "_status")] = "finished"

    # Obter dados de execução do modelo
    end_job = Job.fetch(job_ids["redis_build_model_job_id"], connection=conn)
    execution_data = {"build_model_stage": end_job.meta.get("stage")}

    try:
        user_job = Job.fetch(job_ids["redis_get_user_data_job_id"], connection=conn)
        execution_data.update({
            "num_user_ratings": user_job.meta.get("num_user_ratings"),
            "user_status": user_job.meta.get("user_status"),
        })
    except NoSuchJobError:
        pass

    # Retornar resultado ou status parcial
    if end_job.is_finished:
        return JSONResponse(
            status_code=200,
            content={
                "statuses": job_statuses,
                "execution_data": execution_data,
                "result": end_job.result,
            },
        )
    else:
        return JSONResponse(
            status_code=202,
            content={"statuses": job_statuses, "execution_data": execution_data},
        )
