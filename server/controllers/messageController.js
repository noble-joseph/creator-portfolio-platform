import Message from "../models/Message.js";
import User from "../models/User.js";

// Send a private message from authenticated user to a connection
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.userId;
    const { message, messageType } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    // Check if sender and receiver are connected
    const sender = await User.findById(senderId);
    if (!sender.connections.includes(receiverId)) {
      return res.status(403).json({ message: "You can only send messages to your connections" });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
      messageType: messageType || "appreciation",
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", data: savedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get messages for authenticated user (both sent and received)
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name username profilePhoto")
      .populate("receiver", "name username profilePhoto");

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};
