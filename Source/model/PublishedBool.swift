//
//  PublishedBool.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
import Combine
import SwiftUI

final class PublishedBool: ObservableObject {

    var subject = CurrentValueSubject<Bool, Never>(false)

    var wrappedValue:Bool = false {
        didSet {
            subject.send(self.wrappedValue)
        }
    }
}
