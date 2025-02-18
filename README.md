comandos:

- verificar a versao do python:
python -- version 

conferir se é 3.11.0

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

acho q sera preciso exportar as tabelas do banco como csv e adicionar os arquivos na pasta data

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