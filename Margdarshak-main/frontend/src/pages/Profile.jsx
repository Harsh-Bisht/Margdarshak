export default function Profile() {
  return (
    <div className="flex flex-col items-center p-6">
      <img
        src="https://via.placeholder.com/100"
        alt="User Profile"
        className="w-24 h-24 rounded-full border-2 border-gray-300"
      />
      <h2 className="text-xl font-bold mt-4">User Name</h2>
      <p className="text-gray-600">user@email.com</p>
    </div>
  );
}
