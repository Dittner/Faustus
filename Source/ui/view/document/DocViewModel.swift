//
//  LoginViewModel.swift
//  Faustus
//
//  Created by Alexander Dittner on 17.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Combine
import SwiftUI

final class DocViewModel: ViewModel {
    @Published var selectedConspectus: Conspectus!

    @Published var info: String = "Moderne bezeichnet historisch einen Umbruch in zahlreichen Lebensbereichen gegenüber der Tradition, bedingt durch Industrielle Revolution, Aufklärung und Säkularisierung. In der Philosophiegeschichte fällt der Beginn der Moderne mit dem Skeptizismus der Vordenker der Aufklärung (Montaigne, Descartes, Spinoza) zusammen. 0123456789ÄÜÖßäüö"

    @Published var info2: String = "Немецкий мыслитель, классический филолог, композитор, поэт, создатель самобытного философского учения, которое носит подчёркнуто неакадемический характер (как и другие направления философии жизни) и получило распространение, выходящее далеко за пределы научно-философского сообщества. Фундаментальная концепция включает в себя особые критерии оценки действительности, поставившие под сомнение основополагающие принципы действующих форм морали, религии, культуры и общественно-политических отношений. 0123456789ÄÜÖßäüö"

    private var disposeBag: Set<AnyCancellable> = []

    init() {
        logInfo(tag: .APP, msg: "DocViewModel init")
        model.$selectedConspectus
            .removeDuplicates()
            .assign(to: \.selectedConspectus, on: self)
            .store(in: &disposeBag)

        model.$selectedConspectus
            .removeDuplicates()
            .compactMap { $0 }
            .flatMap { conspectus in
                conspectus.$isEditing
            }
            .removeDuplicates()
            .sink { _ in
                let appDelegate = NSApplication.shared.delegate as! AppDelegate
                appDelegate.window?.makeFirstResponder(nil)

            }.store(in: &disposeBag)
    }
    
    func close() {
        model.closeSelectedConspectus()
    }
}
