//
//  ArrayExtension.swift
//  Faustus
//
//  Created by Alexander Dittner on 01.04.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
extension Array where Element: Equatable {
    func removingDuplicates() -> Array {
        return reduce(into: []) { result, element in
            if !result.contains(element) {
                result.append(element)
            }
        }
    }
}
