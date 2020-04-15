//
//  Debouncer.swift
//  Faustus
//
//  Created by Alexander Dittner on 30.03.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

//Example
//var storeDebouncer: Debouncer = Debouncer(seconds: 5)
//func store() {
//    storeDebouncer.debounce {
//        writeDataOnDisk()
//    }
//}

import Foundation

class Debouncer {
    private let queue = DispatchQueue.main
    private var workItem = DispatchWorkItem(block: {})
    private var interval: TimeInterval

    init(seconds: TimeInterval) {
        interval = seconds
    }

    func debounce(action: @escaping (() -> Void)) {
        workItem.cancel()
        workItem = DispatchWorkItem(block: { action() })
        queue.asyncAfter(deadline: .now() + interval, execute: workItem)
    }
}
