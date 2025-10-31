from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.users.schema import UserCreate
from sqlalchemy.orm import Session
from app.db.connection import get_db
from app.services.users_creation import create_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", status_code=201)
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    db_connection = db.connection()  # Get raw DB connection
    try:
        # Convert Pydantic model to dictionary
        user_data = user.dict()

        # Create user using raw SQL function
        emp_id = create_user(db_connection, user_data)
        return {"message": "User created successfully", "emp_id": emp_id}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    


    
