from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_active_user, get_current_admin
from app.core.database import get_db
from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import OrderResponse


router = APIRouter()


@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Order:
    cart_items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = Decimal("0.00")
    for item in cart_items:
        if item.quantity > item.product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product '{item.product.name}'",
            )
        total_amount += Decimal(item.product.price) * item.quantity

    order = Order(user_id=current_user.id, status="paid", total_amount=total_amount)
    db.add(order)
    db.flush()

    for item in cart_items:
        subtotal = Decimal(item.product.price) * item.quantity
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.product.name,
                unit_price=item.product.price,
                quantity=item.quantity,
                subtotal=subtotal,
            )
        )
        item.product.stock -= item.quantity
        db.delete(item)

    db.commit()
    db.refresh(order)
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order.id)
        .first()
    )


@router.get("/mine", response_model=list[OrderResponse])
def list_my_orders(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[Order]:
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.id.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Order:
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return order


@router.get("", response_model=list[OrderResponse])
def list_all_orders(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
) -> list[Order]:
    return db.query(Order).options(joinedload(Order.items)).order_by(Order.id.desc()).all()
