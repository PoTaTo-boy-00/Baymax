import {
  collection,
  addDoc,
  serverTimestamp,
  increment,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase"; // Update the import path according to your project structure

/**
 * Send a notification to a user
 * @param {string} userId - The ID of the user to send the notification to
 * @param {string} message - The notification message
 * @param {string} type - The type of notification (message, appointment, video-call, etc.)
 * @param {Object} data - Additional data for the notification
 * @returns {Promise<string>} - The ID of the created notification
 */
export async function sendNotification(userId, message, type, data = {}) {
  try {
    // Create the notification
    const notificationRef = await addDoc(collection(db, "notifications"), {
      userId,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
      ...data,
    });

    // Update the user's unread notification count
    await updateDoc(doc(db, "users", userId), {
      unreadNotifications: increment(1),
    });

    return notificationRef.id;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}

/**
 * Send a message notification when a new message is received
 * @param {string} recipientId - The ID of the message recipient
 * @param {string} senderId - The ID of the message sender
 * @param {string} senderName - The name of the message sender
 * @param {string} messagePreview - A preview of the message content
 * @returns {Promise<string>} - The ID of the created notification
 */
export async function sendMessageNotification(
  recipientId,
  senderId,
  senderName,
  messagePreview
) {
  const message = `${senderName}: ${messagePreview}`;
  return sendNotification(recipientId, message, "message", { senderId });
}

/**
 * Send an appointment notification
 * @param {string} userId - The ID of the user to notify
 * @param {string} appointmentId - The ID of the appointment
 * @param {string} message - The notification message
 * @returns {Promise<string>} - The ID of the created notification
 */
export async function sendAppointmentNotification(
  userId,
  appointmentId,
  message
) {
  return sendNotification(userId, message, "appointment", { appointmentId });
}

/**
 * Send a video call notification
 * @param {string} userId - The ID of the user to notify
 * @param {string} callId - The ID of the video call
 * @param {string} callerName - The name of the caller
 * @returns {Promise<string>} - The ID of the created notification
 */
export async function sendVideoCallNotification(userId, callId, callerName) {
  const message = `${callerName} is inviting you to a video call`;
  return sendNotification(userId, message, "video-call", { callId });
}
