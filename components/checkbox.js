import React from 'react';

/**
 * This file is part of the buzzonk app.
 *
 * (c) a4smanjorg5
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default function Checkbox({ name, value, handleChange }) {
    return (
        <input
            type="checkbox"
            name={name}
            checked={!!value}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            onChange={(e) => handleChange(e)}
        />
    );
}
