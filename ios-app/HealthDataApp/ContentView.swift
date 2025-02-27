import SwiftUI

struct ContentView: View {
    @State private var heartRate: Double = 0
    @State private var activity: String = "Unknown"
    @State private var recommendations: [String] = []
    @State private var isLoading = false
    private let healthDataFetcher = HealthDataFetcher()

    var body: some View {
        VStack {
            Text("Heart Rate: \(heartRate, specifier: "%.1f") bpm")
                .font(.largeTitle)
                .padding()

            Text("Activity: \(activity)")
                .font(.title)
                .padding()

            Button("Fetch Heart Rate") {
                fetchHeartRateData()
            }
            .padding()

            if isLoading {
                ProgressView()
            }

            List(recommendations, id: \.self) { song in
                Text(song)
            }
        }
        .onAppear {
            requestHealthKitPermission()
        }
    }

    private func fetchHeartRateData() {
        isLoading = true
        healthDataFetcher.fetchHeartRate { heartRate, error in
            if let heartRate = heartRate {
                self.heartRate = heartRate
                self.activity = healthDataFetcher.determineActivity(heartRate: heartRate)
                fetchRecommendations()
            } else {
                print("Error fetching heart rate: \(error?.localizedDescription ?? "Unknown error")")
            }
            isLoading = false
        }
    }

    private func fetchRecommendations() {
        // Assuming you have a backend API that accepts heart rate and returns song recommendations
        let url = URL(string: "http://127.0.0.1:8000/activity")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = ["heart_rate": heartRate]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let data = data, error == nil {
                do {
                    let result = try JSONDecoder().decode(ActivityResponse.self, from: data)
                    DispatchQueue.main.async {
                        self.recommendations = result.songs.map { $0.name }
                    }
                } catch {
                    print("Error decoding response: \(error)")
                }
            }
        }
        task.resume()
    }

    private func requestHealthKitPermission() {
        healthDataFetcher.requestAuthorization { success, error in
            if success {
                print("HealthKit authorization granted")
            } else {
                print("Error requesting HealthKit authorization: \(error?.localizedDescription ?? "Unknown error")")
            }
        }
    }
}

struct ActivityResponse: Codable {
    let activity: String
    let songs: [Song]
}

struct Song: Codable {
    let name: String
    let artist: String
    let url: String
}
