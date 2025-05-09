import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import withContext from "../withContext";

const initState = {
  name: "",
  price: "",
  stock: "",
  shortDesc: "",
  description: ""
};

class AddProduct extends Component {
  constructor(props) {
    super(props);
    this.state = initState;
  }

  save = async (e) => {
    e.preventDefault();
    const { name, price, stock, shortDesc, description } = this.state;

    if (name && price) {
      const id = Math.random().toString(36).substring(2) + Date.now().toString(36);

      await axios.post(
        "https://ecom-backend-0dq5.onrender.com/products",
        { id, name, price, stock, shortDesc, description }
      );

      this.props.context.addProduct(
        {
          name,
          price,
          shortDesc,
          description,
          stock: stock || 0
        },
        () => this.setState(initState)
      );
      this.setState({
        flash: { status: "alert-success", msg: "Product created successfully" }
      });
    } else {
      this.setState({
        flash: { status: "alert-danger", msg: "Please enter name and price" }
      });
    }
  };

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value, error: "" });

  render() {
    const { name, price, stock, shortDesc, description } = this.state;
    const { user } = this.props.context;

    return !(user && user.accessLevel < 1) ? (
      <Navigate to="/" />
    ) : (
      <>
        <div className="bg-primary text-white py-4">
          <div className="container">
            <h4 className="display-6">Add Product</h4>
          </div>
        </div>
        <div className="container my-5">
          <form onSubmit={this.save}>
            <div className="row justify-content-center">
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="nameInput" className="form-label">
                    Product Name
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="nameInput"
                    name="name"
                    value={name}
                    onChange={this.handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="priceInput" className="form-label">
                    Price
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    id="priceInput"
                    name="price"
                    value={price}
                    onChange={this.handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="stockInput" className="form-label">
                    Available in Stock
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    id="stockInput"
                    name="stock"
                    value={stock}
                    onChange={this.handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="shortDescInput" className="form-label">
                    Short Description
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="shortDescInput"
                    name="shortDesc"
                    value={shortDesc}
                    onChange={this.handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="descriptionInput" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="descriptionInput"
                    rows="2"
                    name="description"
                    value={description}
                    onChange={this.handleChange}
                  />
                </div>
                {this.state.flash && (
                  <div className={`alert ${this.state.flash.status} mb-3`}>
                    {this.state.flash.msg}
                  </div>
                )}
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-primary"
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </>
    );
  }
}

export default withContext(AddProduct);