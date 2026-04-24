from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemResponse, CartItemUpdate, CartSummary


router = APIRouter()


def build_cart_summary(items: list[CartItem]) -> CartSummary:
    total = sum((Decimal(item.product.price) * item.quantity for item in items), Decimal("0.00"))
    return CartSummary(
        items=[CartItemResponse.model_validate(item) for item in items],
        total_amount=total,
    )


@router.get("", response_model=CartSummary)
def get_cart(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> CartSummary:
    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    return build_cart_summary(items)


@router.post("/items", response_model=CartSummary, status_code=status.HTTP_201_CREATED)
def add_item_to_cart(
    payload: CartItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> CartSummary:
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < payload.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock available")

    item = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id, CartItem.product_id == payload.product_id)
        .first()
    )
    if item:
        new_quantity = item.quantity + payload.quantity
        if new_quantity > product.stock:
            raise HTTPException(status_code=400, detail="Requested quantity exceeds stock")
        item.quantity = new_quantity
    else:
        item = CartItem(user_id=current_user.id, product_id=payload.product_id, quantity=payload.quantity)
        db.add(item)

    db.commit()
    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    return build_cart_summary(items)


@router.put("/items/{product_id}", response_model=CartSummary)
def update_cart_item(
    product_id: int,
    payload: CartItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> CartSummary:
    item = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id, CartItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if payload.quantity > item.product.stock:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds stock")

    item.quantity = payload.quantity
    db.commit()

    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    return build_cart_summary(items)


@router.delete("/items/{product_id}", response_model=CartSummary)
def remove_cart_item(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> CartSummary:
    item = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id, CartItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()

    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    return build_cart_summary(items)
