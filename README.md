- verificar a versao do python:
python -- version 

conferir se é 3.11.0, se nao, instalar.

- instalar pipenv
pip install pipenv

- instalar as dependencias no ambiente virtual
pipenv install

caso de erro:
error: Microsoft Visual C++ 14.0 or greater is required. Get it with "Microsoft C++ Build Tools": https://visualstudio.microsoft.com/visual-cpp-build-tools/

- entrar no ambiente virtual
pipenv shell

- subir o redis
pipenv run python worker.py

- subir api
uvicorn main:app --reload


rodando os scripts para popular o banco:

1- pipenv run python scraping/get_popular_user.py
2- pipenv run python scraping/get_user_ratings.py
3- pipenv run python scraping/get_ratings.py
4- pipenv run python scraping/get_movies.py 

acho q sera preciso exportar a tabela ratings do banco como csv e adiciona-la na pasta data

rodando os scripts para treinamento:

1- pipenv run python model/create_training_data.py
2- pipenv run python model/build_model.py
3- pipenv run python model/run_model.py


campos da url:
- username (Username for whom the model is being built)
- training_data_size (Number of rows for the training dataset sample): 
    - default: 200000
    - min: 100000
    - max: 800000
- popularity_threshold (Threshold for filtering popular movies (optional)):
    - default: none
    - min: -1
    - max: 7
- num_items:
    - default: 30


apos subir a api, esses sao os endpoints e suas respectivas URLs a serem executadas para receber as recomendações para o usuario desejado:

- GET RECS (modificar os query params)
    http://127.0.0.1:8000/get_recs?username=wiped_issues&training_data_size=200000&popularity_filter=1&data_opt_in=true

- GET RESULTS (o redis armazena os resultados por 30 segundos, os query params sao os ids retornados na response do get_recs)
    http://127.0.0.1:8000/results?redis_build_model_job_id=d4f828bc-41eb-4ca8-86d9-f177b7ed7f0e&redis_get_user_data_job_id=c50a6893-e256-4c7f-86b3-26d9d5dfc118
    

FRONTEND:
- acessar o diretorio /frontend e rodar o comando "npm install"
- para subir o frontend rodar os seguintes comandos:
    - npx next build
    - npx next start
- a porta usada é a 3000. ou seja, http://localhost:3000