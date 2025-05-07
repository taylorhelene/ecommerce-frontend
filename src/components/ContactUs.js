import React, { useState } from "react";
import withContext from "../withContext";

const ContactUs = props => {
  const { contact } = props.context;  
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await contact(formData);
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-center container">
        <h4 className="title">Contact Us</h4>
      </div>
      
      <form onSubmit={handleSubmit} className="d-flex justify-content-center p-4 m-4" data-aos="fade-up" data-aos-delay="600">
        <div className="row gy-4">
          <div className="col-md-6">
            <input 
              type="text" 
              name="name" 
              className="form-control" 
              placeholder="Your Name" 
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <input 
              type="email" 
              className="form-control" 
              name="email" 
              placeholder="Your Email" 
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-12">
            <input 
              type="text" 
              className="form-control" 
              name="subject" 
              placeholder="Subject" 
              required
              value={formData.subject}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-12">
            <textarea 
              className="form-control" 
              name="message" 
              rows="6" 
              placeholder="Message" 
              required
              value={formData.message}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="col-md-12 text-center">
            {isLoading && <div className="loading">Loading</div>}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="sent-message">Your message has been sent. Thank you!</div>}
          </div>
          
          <div align='center'>
            <button className="rounded-pill" type="submit" disabled={isLoading}>
              Send Message
            </button>  
          </div>
        </div>
      </form>
    </div>
  );
}

export default withContext(ContactUs);