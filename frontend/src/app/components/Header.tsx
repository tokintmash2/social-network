'use client'
import { useRouter } from 'next/navigation'
import NotificationSystem from "./NotificationSystem";

const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch('http://localhost:8080/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      router.push('/login');
    }
  };

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <a className="btn btn-ghost text-xl rounded-lg p-2 transition-transform hover:bg-transparent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
        </a>
      </div>
      
      <div className="navbar-center hidden lg:flex">
      <ul className="menu menu-horizontal px-1">
      <li>
  <a className=" h-12 relative inline-flex items-center h-10 cursor-pointer px-3 py-2">Home</a>
</li>


  <li>
    <div className="dropdown dropdown-bottom">
      <label tabIndex={0} className="relative inline-flex items-center h-10 cursor-pointer px-3 py-2">Groups</label>
      <ul tabIndex={0} className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-1">
        <li><a>My groups</a></li>
        <li><a>My events</a></li>
        <li><a>Find groups</a></li>
      </ul>
    </div>
  </li>
  <li>
    <NotificationSystem />
  </li>
  <li className="h-12"><a className="relative inline-flex items-center cursor-pointer px-3 py-2 h-full">My profile</a></li>
</ul>


      </div>

      <div className="navbar-end">
        <button 
          onClick={handleLogout}
          className="btn btn-ghost"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
