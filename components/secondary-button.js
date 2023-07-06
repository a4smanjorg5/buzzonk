import React from 'react';

/**
 * This file is part of the buzzonk app.
 *
 * (c) a4smanjorg5
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default function SecondaryButton({ type = "button", className = '', handleClick, children }) {
    return (
        <button
            type={type}
            className={'inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150 ' + className}
            onClick={(e) => handleClick && handleClick(e)}>
            {children}
        </button>
    );
}
