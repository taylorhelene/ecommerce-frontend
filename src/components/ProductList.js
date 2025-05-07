import React from "react";
import ProductItem from "./ProductItem";
import withContext from "../withContext";

const ProductList = props => {
  const { products } = props.context;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-center container">
        <h4 className="title">Our Products</h4>
      </div>
      
      <div className="container">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {products && products.length ? (
            products.map((product, index) => (
              <div className="col" key={index}>
                <ProductItem
                  product={product}
                  addToCart={props.context.addToCart}
                />
              </div>
            ))
          ) : (
            <div className="col">
              <span className="text-muted display-6">
                No products found!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withContext(ProductList);