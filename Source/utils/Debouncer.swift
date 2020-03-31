//
//  Debouncer.swift
//  Faustus
//
//  Created by Alexander Dittner on 30.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation

class Debouncer {
    // MARK: - Properties

    private let queue = DispatchQueue.main
    private var workItem = DispatchWorkItem(block: {})
    private var interval: TimeInterval

    // MARK: - Initializer

    init(seconds: TimeInterval) {
        interval = seconds
    }

    // MARK: - Debouncing function

    func debounce(action: @escaping (() -> Void)) {
        workItem.cancel()
        workItem = DispatchWorkItem(block: { action() })
        queue.asyncAfter(deadline: .now() + interval, execute: workItem)
    }
}
