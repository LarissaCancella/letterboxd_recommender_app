import os
import redis
from rq import Worker, Queue

# Filas que o worker vai escutar
listen = ['high', 'default', 'low']

# Obtém a URL do Redis, com fallback para localhost
#redis_url = os.getenv('REDISCLOUD_URL', 'redis://localhost:6379')

# Verifica se a URL do Redis é válida
#if not redis_url:
#    raise ValueError("A URL do Redis não está configurada corretamente.")


# Conecta ao Redis
#conn = redis.from_url(redis_url)
conn = redis.Redis(host='localhost', port=6379, db=0)

if __name__ == '__main__':
    print("Iniciando o worker RQ...")
    queues = [Queue(name, connection=conn) for name in listen]
    worker = Worker(queues, connection=conn)
    worker.work()