import React from 'react';
import Avatar from 'react-avatar';

function Client({username}) {

  return (
    <div className="d-flex align-items-center mb-3 p-2" style={{ 
      backgroundColor: "#2f4f7f", 
      borderRadius: "5px",
      border: "1px solid #3498db"
    }}>
      <Avatar 
        name={username.toString()} 
        size={50} 
        round="14px" 
        className="mr-3" 
        color="#3498db"
      />
      <span className='mx-2' style={{ color: "#fff" }}>{username.toString()}</span>
    </div>
  );
}

export default Client;
