from sqlalchemy import Column, Integer, Text
from src.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    email = Column(Text, nullable=False, unique=True)
    senha_hash = Column(Text, nullable=False)