function CartItem({ product }) {
  // ... existing code ...

  return (
    <div>
      {/* ... other product details ... */}
      <p>Price: ${product.price ? product.price.toFixed(2) : '0.00'}</p>
    </div>
  );
}