import React from 'react';
import './Avatar.css';

/**
 * Composant Avatar réutilisable
 * Affiche soit une photo de profil, soit les initiales de l'utilisateur
 */
const Avatar = ({ 
  user, 
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  onClick = null,
  editable = false,
  onEdit = null,
  uploading = false
}) => {
  const getInitials = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium',
    large: 'avatar-large',
    xlarge: 'avatar-xlarge'
  };

  const avatarStyle = user?.profile_picture 
    ? {
        backgroundImage: `url(http://localhost:5000/uploads/${user.profile_picture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'transparent'
      }
    : {
        backgroundColor: '#0066ff',
        background: 'linear-gradient(135deg, #0066ff 0%, #00a3ff 100%)'
      };

  return (
    <div 
      className={`avatar-container ${sizeClasses[size]} ${className} ${onClick ? 'avatar-clickable' : ''}`}
      onClick={onClick}
    >
      <div 
        className="avatar"
        style={avatarStyle}
      >
        {!user?.profile_picture && (
          <span className="avatar-initials">
            {getInitials()}
          </span>
        )}
      </div>
      {editable && onEdit && (
        <button
          className="avatar-edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          disabled={uploading}
          title="Modifier la photo de profil"
        >
          {uploading ? (
            <span className="spinner-small">⏳</span>
          ) : (
            <span>📷</span>
          )}
        </button>
      )}
    </div>
  );
};

export default Avatar;
