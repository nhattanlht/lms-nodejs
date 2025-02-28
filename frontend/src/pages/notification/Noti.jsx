import React, { useEffect, useState } from "react";
import "./noti.css"; // Import the CSS file
import axios from "axios";
import Loading from "../../components/loading/Loading";
import { MdMail } from "react-icons/md"; // Import Mail Icon from React Icons
import { FaBell } from "react-icons/fa";  // Import Bell Icon from React Icons
import { FaDownload } from "react-icons/fa";
import io from 'socket.io-client';

const userId = localStorage.getItem('userId'); // Giả sử bạn lưu userId trong localStorage sau khi đăng nhập

if (!userId) {
  console.error('User is not logged in!');
}

const server = import.meta.env.VITE_SERVER_URL;
const socket = io(server, {
  query: { userId }, // Truyền userId thực tế vào query của Socket.IO
});

const Noti = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);


  console.log("Fetching notifications...");

  const getNotifications = async () => {
    try {
      const token = localStorage.getItem('token');

      // Gửi yêu cầu GET với token trong header
      const response = await fetch(`${server}/api/notification/me`, {
        method: 'GET',
        headers: {
          'token': token,
        },
      });

      // Kiểm tra mã trạng thái phản hồi
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setNotifications(data.notifications);

        const notificationsWithRoles = data.notifications.map((notification) => ({
          ...notification,
          isSender: notification.sender?._id === user._id,
        }));

        const sortedNotifications = notificationsWithRoles.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedNotifications);
        if (!selectedNotification && sortedNotifications.length > 0) {
          setSelectedNotification(sortedNotifications[0]);
        }

      } else {
        console.error('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false); // Sau khi hoàn thành việc tải dữ liệu, cập nhật loading thành false
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification); // Cập nhật thông báo đã chọn

    try {
      const response = await fetch(`${server}/api/notification/mark-as-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token'),
        },
        body: JSON.stringify({
          notificationId: notification._id,
        }),

      });

      if (response.ok) {
        console.log('Notification marked as read');

        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif._id === notification._id ? { ...notif, read: true } : notif
          )
        );

      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isRead = (notification) => {
    const readBy = notification.readBy.map((id) => id.toString());
    return readBy.includes(user._id);
  };

  useEffect(() => {
    socket.on('newNotification', (notification) => {
      if(notification.recipients.includes(user._id)){
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      }

    });

    getNotifications();
    return () => socket.off("newNotification");
  }, []);


  return (
    <>
      {loading ? (
        <Loading />
      ) : notifications.length === 0 ? (
        <div className="container">
          <h2>No notification!</h2>

        </div>

      ) : (
        <div className="container">
          <div className="notification-list">
            <h2>  <FaBell className="iconBell" /> Your Notifications
            </h2>
            {notifications.map((notification) => (

              <div
                key={notification._id}
                className={`notification-item ${notification.isSender || isRead(notification) || notification.read ? 'read' : ''}`}
                onClick={() => {if(!notification.isSender)handleNotificationClick(notification)}} // Khi click vào thông báo, gọi hàm đánh dấu là đã đọc
              >
                <div className="notification-title">

                  <div className="notification-time">{new Date(notification.createdAt).toLocaleString()}</div>

                  <div className="notification-tcontent">{notification.subject}</div>
                  <p>By: {notification.sender?.name}</p>
                  <div className="notification-tmessage">
                    {notification.message.length > 500
                      ? `${notification.message.slice(0, 100)}...`
                      : notification.message}

                  </div>

                </div>

                <div className="type">
                  {notification.isSender ? 'You sent. ' : 'You received. '}
                </div>

              </div>

            ))}
          </div>

          <div className="notification-detail">
            {selectedNotification ? (
              <>

                <div className="notification-content-box">

                  <div className="notification-sender">

                    <h3 className="notification-header">
                      <MdMail className="iconD" />
                      {selectedNotification.subject}</h3>

                    <p>By: {selectedNotification.sender.name} • {selectedNotification.sender.email}</p>
                  </div>

                  <div className="notification-time">
                    Sent at: {new Date(selectedNotification.createdAt).toLocaleString()}
                  </div>
                </div>
                <hr ></hr>
                <div className="notification-content-box2">


                  <div className="notification-content">{selectedNotification.message}
                  </div>


                  {selectedNotification.file && (
                    <a
                      href={selectedNotification.file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p>
                        <FaDownload className="iconD" />
                        {selectedNotification.file.path}
                      </p>
                    </a>
                  )}
                </div>
              </>
            ) : (
              <p>Select a notification to see the details</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Noti;