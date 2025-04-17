import React, { useState } from 'react';
import './sidebar.css';
import {
  FiMenu,
  FiPlus,
  FiMessageSquare,
  FiHelpCircle,
  FiClock,
  FiSettings
} from 'react-icons/fi';

const Sidebar = () => {
  const [extended, setExtended] = useState(false); 

  const toggleSidebar = () => {
    setExtended(prev => !prev);
  };

  return (
    <div className={`sidebar ${extended ? '' : 'collapsed'}`}>
      <div className="top">
        <div className='menu' onClick={toggleSidebar} style={{ cursor: 'pointer' }}>
          <FiMenu size={20} />
        </div>

        <div className="new-chat">
          <FiPlus size={20} />
          {extended && <p>New chat</p>}
        </div>

        {extended && (
          <div className="recent">
            <p className="recent-title">Recent</p>
            <div className="recent-entry">
              <FiMessageSquare size={18} />
              <p>what is react....</p>
            </div>
          </div>
        )}
      </div>

      <div className="bottom">
        <div className="bottom-item recent-entry">
          <FiHelpCircle size={18} />
          {extended && <p>Help</p>}
        </div>
        <div className="bottom-item recent-entry">
          <FiClock size={18} />
          {extended && <p>Activity</p>}
        </div>
        <div className="bottom-item recent-entry">
          <FiSettings size={18} />
          {extended && <p>Setting</p>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
