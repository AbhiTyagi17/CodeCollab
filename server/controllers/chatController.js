const Message = require('../models/Message');

// Get previous messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('senderId', 'name email avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMessages };