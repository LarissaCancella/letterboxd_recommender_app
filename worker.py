import os
import redis
from rq import Worker, Queue, Connection

# Filas que o worker vai escutar
listen = ['high', 'default', 'low']

# Obtém a URL do Redis, com fallback para localhost
redis_url = os.getenv('REDISCLOUD_URL', 'redis://localhost:6379')

# Verifica se a URL do Redis é válida
if not redis_url:
    raise ValueError("A URL do Redis não está configurada corretamente.")

# Conecta ao Redis
conn = redis.from_url(redis_url)

if __name__ == '__main__':
    with Connection(conn):
        print("Iniciando o worker RQ...")
        worker = Worker(map(Queue, listen))
        worker.work()
