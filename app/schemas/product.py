from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str = Field(min_length=10)
    price: Decimal = Field(gt=0)
    stock: int = Field(ge=0)
    sku: str = Field(min_length=3, max_length=100)
    category: str | None = Field(default=None, max_length=100)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, min_length=10)
    price: Decimal | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    sku: str | None = Field(default=None, min_length=3, max_length=100)
    category: str | None = Field(default=None, max_length=100)


class ProductResponse(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
