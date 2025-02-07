'use client';
import React, { useState } from 'react';
import { IoMdSend } from 'react-icons/io';
import { BsEmojiSmile } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';

const Inbox = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false); // Close picker after selecting an emoji
  };

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      console.log('Message sent:', message);
      setMessage(''); // Clear the input after sending
    }
  };

  return (
    <div className="flex flex-col h-screen min-w-full">
      {/* Messages Section */}
      <div className="flex-grow p-4 bg-gray-100 overflow-y-auto">
        {/* Example Messages */}
        <div className="mb-4">
          <p className="bg-yellow-200 text-gray-800 p-3 rounded-lg inline-block">
            Hello! How can I help you?
          </p>
        </div>
        <div className="mb-4 text-right">
          <p className="bg-blue-200 text-gray-800 p-3 rounded-lg inline-block">
            I'm looking for more details about the project.
          </p>
        </div>
      </div>

      {/* New Message Input */}
      <div className="flex items-center gap-2 p-4 bg-white border-t border-gray-300 relative">
        {/* Emoji Picker Toggle Button */}
        <button
          type="button"
          className="p-2 text-gray-600 hover:text-yellow-600 focus:outline-none"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <BsEmojiSmile size={24} />
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-20">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* Input Field */}
        <input
          type="text"
          value={message}
          placeholder="New Message"
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow border bg-white border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-800"
        />

        {/* Send Button */}
        <button
          type="button"
          className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          onClick={handleSendMessage}
        >
          <IoMdSend size={24}/>
        </button>
      </div>
    </div>
  );
};

export default Inbox;
