import React from 'react';
import { Transition } from '@headlessui/react';

/**
 * This file is part of the buzzonk app.
 *
 * (c) a4smanjorg5
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default function ActionMessage({ on, theme = 'gray', className, children }) {
    return (
        <div>
            <Transition show={!!on} leave="transition ease-in duration-1000" leaveFrom="opacity-100" leaveTo="opacity-0" className={`text-sm text-${theme}-600 ` + (className || '')}>
                {children}
            </Transition>
        </div>
    );
}
