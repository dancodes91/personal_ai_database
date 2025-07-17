"""
Authentication endpoints for the Personal AI Database
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
import hashlib
import os
from app.core.config import settings

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_email: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ChangePasswordResponse(BaseModel):
    message: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hash_password(plain_password) == hashed_password

def update_env_password(new_password: str):
    """Update password in .env file"""
    env_path = ".env"
    if not os.path.exists(env_path):
        # Create .env file if it doesn't exist
        with open(env_path, "w") as f:
            f.write(f"USER_EMAIL={settings.user_email}\n")
            f.write(f"USER_PASSWORD={new_password}\n")
    else:
        # Read existing .env file
        with open(env_path, "r") as f:
            lines = f.readlines()
        
        # Update password line
        updated = False
        for i, line in enumerate(lines):
            if line.startswith("USER_PASSWORD="):
                lines[i] = f"USER_PASSWORD={new_password}\n"
                updated = True
                break
        
        # Add password line if not found
        if not updated:
            lines.append(f"USER_PASSWORD={new_password}\n")
        
        # Write back to file
        with open(env_path, "w") as f:
            f.writelines(lines)

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and return access token
    """
    # Check credentials
    if request.email != settings.user_email or request.password != settings.user_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": request.email}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_email=request.email
    )

@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: str = Depends(verify_token)
):
    """
    Change user password
    """
    # Verify current password
    if request.current_password != settings.user_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if len(request.new_password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 4 characters long"
        )
    
    # Update password in .env file
    try:
        update_env_password(request.new_password)
        
        # Update settings in memory (note: this will be reset on server restart)
        settings.user_password = request.new_password
        
        return ChangePasswordResponse(message="Password updated successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update password: {str(e)}"
        )

@router.get("/verify")
async def verify_auth(current_user: str = Depends(verify_token)):
    """
    Verify if the current token is valid
    """
    return {"email": current_user, "message": "Token is valid"}
