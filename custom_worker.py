import redis
from rq import SimpleWorker, Queue
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Filas que o worker vai escutar
listen = ['high', 'default', 'low']

# Conecta ao Redis
conn = redis.Redis(host='localhost', port=6379, db=0)

class WindowsWorker(SimpleWorker):
    def setup_death_penalties(self):
        # Disable death penalties (timeouts) on Windows
        pass

def run_worker():
    logger.info("Worker iniciado. Aguardando jobs...")
    queues = [Queue(name, connection=conn) for name in listen]
    worker = WindowsWorker(queues, connection=conn)
    worker.work(burst=False)  # Set burst=False to keep the worker running

if __name__ == "__main__":
    run_worker()