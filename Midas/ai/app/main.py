from fastapi import FastAPI

app = FastAPI(title="MIDAS AI")


@app.get("/")
def read_root():
    return {"message": "MIDAS AI está em execução."}
