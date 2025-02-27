import Foundation
import HealthKit

class HealthDataFetcher {
    let healthStore = HKHealthStore()

    // Request authorization to access heart rate data
    func requestAuthorization(completion: @escaping (Bool, Error?) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            completion(false, NSError(domain: "HealthKit", code: 1, userInfo: [NSLocalizedDescriptionKey: "HealthKit is not available on this device"]))
            return
        }

        let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate)!
        let readTypes: Set<HKObjectType> = [heartRateType]

        healthStore.requestAuthorization(toShare: nil, read: readTypes, completion: completion)
    }

    // Fetch the latest heart rate from HealthKit
    func fetchHeartRate(completion: @escaping (Double?, Error?) -> Void) {
        guard let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate) else {
            completion(nil, NSError(domain: "HealthKit", code: 2, userInfo: [NSLocalizedDescriptionKey: "Unable to create heart rate type"]))
            return
        }

        let query = HKSampleQuery(sampleType: heartRateType, predicate: nil, limit: 1, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)]) { _, results, error in
            guard let sample = results?.first as? HKQuantitySample else {
                completion(nil, error)
                return
            }
            let heartRate = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))
            completion(heartRate, error)
        }

        healthStore.execute(query)
    }

    // Determine the user's activity based on heart rate
    func determineActivity(heartRate: Double) -> String {
        if heartRate < 70 {
            return "sitting"
        } else if heartRate < 100 {
            return "walking"
        } else if heartRate < 140 {
            return "running"
        } else {
            return "exercise"
        }
    }
}
