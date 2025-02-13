import React , { useState } from 'react';

export default function Footer() {
    return (
      <footer className="bg-black text-white py-7 w-full "  >
        <div className="container mx-auto px-4 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Us */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <p>Email: <a href="mailto:support@example.com" className="text-blue-400 hover:underline">garvit.sharma@juntrax.com</a></p>
              <button className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">Careers</button>
            </div>
  
            {/* Quick Links */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              <ul>
                <li><a href="/home" className="hover:text-blue-400">Home</a></li>
                <li><a href="/" className="hover:text-blue-400">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400">Services</a></li>
                <li><a href="https://juntrax.com/blog/" className="hover:text-blue-400">Blog</a></li>
              </ul>
            </div>
  
            {/* Social Media */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Follow Us</h2>
              <div className="flex space-x-4">
              <a href="https://in.linkedin.com/company/juntrax" className="hover:text-blue-400"> LinkedIn</a>
                <a href="https://twitter.com/juntrax" className="hover:text-blue-400"> Twitter</a>
                <a href="https://www.instagram.com/juntrax/" className="hover:text-blue-400"> Instagram</a>
                
              </div>
            </div>
          </div>
  
          {/* Bottom Text */}
          <div className="mt-8 text-center border-t border-gray-700 pt-4">
            <p>© {new Date().getFullYear()} juntrax. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    );
  }
  