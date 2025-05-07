import React from "react";

const ProductItem = props => {
  const { product } = props;
  return (
    <div className="card h-100 m-2">
      <div className="row g-0">
        <div class Measurements="col-md-4 d-flex align-items-center">
          <img
            src={product.img}
            alt={product.shortDesc}
            className="img-fluid rounded-start"
          />
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title text-capitalize">
              {product.name}{" "}
              <span className="badge bg-primary">${product.price}</span>
            </h5>
            <p className="card-text">{product.shortDesc}</p>
            <p className="card-text">
              {product.stock > 0 ? (
                <small className="text-muted">{product.stock} Available</small>
              ) : (
                <small className="text-danger">Out Of Stock</small>
              )}
            </p>
            <button
              className="p-2 rounded-pill"
              onClick={() =>
                props.addToCart({
                  id: product.name,
                  product,
                  amount: 1
                })
              }
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;