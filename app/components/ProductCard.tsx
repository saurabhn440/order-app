function ProductCard({ product }: ProductCardProps) {
  // ... existing code ...

  console.log('Product price:', product.price);

  return (
    <div className="...">
      {/* ... other elements ... */}
      <div className="...">
        <p className="...">
          ₹{product.price ? product.price.toFixed(2) : 'Price unavailable'}
        </p>
        {/* ... other elements ... */}
      </div>
    </div>
  );
}