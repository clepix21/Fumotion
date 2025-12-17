import React from 'react';
import { useNavigate } from 'react-router-dom';

const ConversationList = ({ conversations, selectedUserId, onSelectUser }) => {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col bg-white border-r">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        Aucune conversation pour le moment.
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectUser(conv.id)}
                            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUserId === conv.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                                }`}
                        >
                            <div className="relative">
                                <img
                                    src={conv.profile_picture || 'https://via.placeholder.com/40'}
                                    alt={`${conv.first_name} ${conv.last_name}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                {/* Indicateur de statut si besoin */}
                            </div>

                            <div className="ml-4 flex-1">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-gray-900">
                                        {conv.first_name} {conv.last_name}
                                    </h3>
                                    {conv.last_message_date && (
                                        <span className="text-xs text-gray-500">
                                            {new Date(conv.last_message_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <p className={`text-sm truncate ${!conv.is_read && conv.last_message_sender_id !== conv.id ? 'font-bold text-black' : 'text-gray-500'}`}>
                                    {conv.last_message_sender_id === conv.id ? 'Vous: ' : ''}{conv.last_message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ConversationList;
