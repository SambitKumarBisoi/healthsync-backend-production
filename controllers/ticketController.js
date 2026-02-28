import Ticket from "../models/Ticket.js";

/**
 * CREATE TICKET (Doctor / Patient)
 */
export const createTicket = async (req, res) => {
  try {
    const { category, priority, message } = req.body;

    if (!category || !message) {
      return res.status(400).json({
        success: false,
        message: "Category and message are required",
      });
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      category,
      priority,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET MY TICKETS (Doctor / Patient)
 */
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get my tickets error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ADMIN: GET ALL TICKETS
 */
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get all tickets error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ADMIN: UPDATE TICKET STATUS
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["OPEN", "IN_PROGRESS", "RESOLVED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      ticket,
    });
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ADMIN: ADD RESOLUTION NOTE
 */
export const addAdminResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { adminResponse },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin response added successfully",
      ticket,
    });
  } catch (error) {
    console.error("Add admin response error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};