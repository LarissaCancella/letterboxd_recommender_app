import redis
from rq import SimpleWorker, Queue
from rq.job import Job

# Filas que o worker vai escutar
listen = ['high', 'default', 'low']

# Conecta ao Redis
conn = redis.Redis(host='localhost', port=6379, db=0)

class WindowsWorker(SimpleWorker):
    def execute_job(self, job, queue):
        def execute():
            self.perform_job(job, queue)
            self.heartbeat()

        execute()

if __name__ == '__main__':
    print("Iniciando o worker RQ...")
    queues = [Queue(name, connection=conn) for name in listen]
    
    worker = WindowsWorker(queues, connection=conn)
    
    print("Iniciando o processamento de jobs...")
    worker.work(with_scheduler=True, burst=False)