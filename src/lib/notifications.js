import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    // Check if user exists
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User does not exist:", userId);
      return null;
    }

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
    // Instead of using increment which requires a separate index,
    // we'll get the current count and increment it manually
    const userData = userSnap.data();
    const currentCount = userData.unreadNotifications || 0;

    await updateDoc(userRef, {
      unreadNotifications: currentCount + 1,
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
