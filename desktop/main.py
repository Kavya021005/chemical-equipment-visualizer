import sys
import requests
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout,
    QPushButton, QLabel, QFileDialog, QMessageBox
)
import matplotlib.pyplot as plt

API_URL = "http://127.0.0.1:8000/api/upload-csv/"


class EquipmentApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Equipment Visualizer")
        self.setGeometry(200, 200, 420, 300)

        layout = QVBoxLayout()

        self.label = QLabel("Upload CSV to visualize data")
        self.label.setStyleSheet("font-size: 14px;")

        self.upload_btn = QPushButton("Upload CSV")
        self.upload_btn.setStyleSheet("padding: 8px; font-size: 13px;")
        self.upload_btn.clicked.connect(self.upload_csv)

        layout.addWidget(self.label)
        layout.addWidget(self.upload_btn)
        self.setLayout(layout)

    def upload_csv(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Select CSV File",
            "",
            "CSV Files (*.csv)"
        )

        if not file_path:
            return

        try:
            # ✅ KEEP POST INSIDE WITH BLOCK
            with open(file_path, "rb") as f:
                files = {"file": f}  # matches serializer
                response = requests.post(API_URL, files=files)

            if response.status_code not in (200, 201):
                QMessageBox.critical(
                    self,
                    "API Error",
                    f"Status Code: {response.status_code}\n\n{response.text}"
                )
                return

            data = response.json()

            total = data.get("total_count", "N/A")
            self.label.setText(f"Total Equipment: {total}")

            distribution = data.get("type_distribution", {})

            if not distribution:
                QMessageBox.warning(
                    self,
                    "No Data",
                    "No equipment distribution data found."
                )
                return

            plt.figure(figsize=(6, 4))
            plt.bar(distribution.keys(), distribution.values())
            plt.title("Equipment Type Distribution")
            plt.xlabel("Equipment Type")
            plt.ylabel("Count")
            plt.tight_layout()
            plt.show()

        except Exception as e:
            QMessageBox.critical(self, "Error", str(e))


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = EquipmentApp()
    window.show()
    sys.exit(app.exec_())
