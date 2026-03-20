import mysql.connector
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    birthDate: Optional[str] = None
    zip: Optional[str] = None
    city: Optional[str] = None

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a connection to the database
conn = mysql. connector. connect(
    database=os.getenv("MYSQL_DATABASE"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_ROOT_PASSWORD"),
    port=3306,
    host=os.getenv("MYSQL_HOST") )

@app.get("/users")
async def get_users () :
    cursor = conn.cursor(dictionary=True)
    sql_select_Query = "select * from utilisateur"
    cursor.execute(sql_select_Query)
    # get all records
    records = cursor. fetchall()
    print("Total number of rows in table: ", cursor. rowcount)
    # renvoyer nos données et 200 code OK
    return {'utilisateurs': records}

@app.post("/users", status_code=201)
async def create_user(user: UserCreate):
    cursor = conn.cursor(dictionary=True)
    
    # 1. Vérification de l'email existant
    cursor.execute("SELECT id FROM utilisateur WHERE email = %s", (user.email,))
    if cursor.fetchone():
        # Correspond exactement à ce que React attend : error.response.data.message
        return JSONResponse(status_code=400, content={"message": "EMAIL_ALREADY_EXISTS"})
        
    try:
        sql_insert_query = """
            INSERT INTO utilisateur (firstName, lastName, email, birthDate, zip, city)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        # 2. Remplacer les chaînes vides par None et formater la date pour MySQL (YYYY-MM-DD)
        b_date = None if not user.birthDate else user.birthDate.split('T')[0]
        z_code = None if not user.zip else user.zip
        u_city = None if not user.city else user.city
        
        insert_tuple = (user.firstName, user.lastName, user.email, b_date, z_code, u_city)
        cursor.execute(sql_insert_query, insert_tuple)
        conn.commit()
        
        # 3. Retourner l'utilisateur créé avec son nouvel ID
        new_user = user.model_dump()
        new_user["id"] = cursor.lastrowid
        return new_user
    except Exception as e:
        conn.rollback()
        print(f"Erreur lors de la création de l'utilisateur : {e}")
        return JSONResponse(status_code=500, content={"message": "SERVER_ERROR"})

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM utilisateur WHERE id = %s", (user_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return JSONResponse(status_code=404, content={"message": "USER_NOT_FOUND"})
        return {"message": "USER_DELETED"}
    except Exception as e:
        conn.rollback()
        print(f"Erreur lors de la suppression de l'utilisateur : {e}")
        return JSONResponse(status_code=500, content={"message": "SERVER_ERROR"})