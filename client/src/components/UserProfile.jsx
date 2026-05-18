import { useSelector } from 'react-redux';

const UserProfile = () => {
    const user  = useSelector((state) => state.user.user);
    const dpic  = "https://www.pngmart.com/files/23/Profile-PNG-Photo.png";

    return (
        <>
            <img src={user?.profilepic ? user.profilepic : dpic} className='profilepic' alt="profile" />
            <div style={{ textAlign: 'center' }}>
                <strong>{user?.fullName}</strong>
                <p style={{ color: '#666', fontSize: '.85rem', margin: '.25rem 0' }}>
                    {user?.userType === "trader" ? " Trader" : " Driver"}
                </p>
                {user?.userType === "trader" && user?.companyName && (
                    <p style={{ fontSize: '.82rem', color: '#555' }}>{user.companyName}</p>
                )}
                {user?.userType === "driver" && user?.vehicleType && (
                    <p style={{ fontSize: '.82rem', color: '#555' }}>Vehicle: {user.vehicleType}</p>
                )}
                <p style={{ fontSize: '.82rem', color: '#777' }}>rate{user?.rating || "5.0"}</p>
            </div>
        </>
    )
}
export default UserProfile;
