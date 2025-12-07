import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import SearchModal, { useSearchModal } from './SearchModal';

const Layout = ({ children }) => {
    const { isOpen, close } = useSearchModal();

    return (
        <div className="min-h-screen bg-animated">
            <Navbar />
            <Sidebar />
            {/* Main content: no left margin on mobile, sidebar margin on md+ */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 md:ml-64 pt-[72px]">
                {/* Add bottom padding on mobile for bottom nav */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 md:pb-6">
                    {children}
                </main>
            </div>

            {/* Global Search Modal */}
            <SearchModal isOpen={isOpen} onClose={close} />
        </div>
    );
};

export default Layout;
