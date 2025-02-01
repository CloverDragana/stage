function Navbar(){

    const navItems = [
        { title: 'Profile', href: '/profile'},
        { title: 'Explore', href: ''},
        { title: 'Notifications', href: ''},
        { title: 'Messages', href: ''},
        { title: 'Settings', href: '/account-setting'}
    ];
    return(
        <nav className="fixed top-16 left-0 h-screen w-42 m-0 flex flex-col bg-primary text-black text-xl shadow-lg">
            <ul>
                {navItems.map((item) => (
                    <li key={item.title} className="w-full">
                        <a href={item.href} className="block w-full px-2 py-3 hover:bg-secondary hover:text-white transition-colors">
                            {item.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Navbar;