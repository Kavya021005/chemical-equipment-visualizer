from django.db import models


class DatasetUpload(models.Model):
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    total_count = models.IntegerField(default=0)
    avg_flowrate = models.FloatField(default=0)
    avg_pressure = models.FloatField(default=0)
    avg_temperature = models.FloatField(default=0)

    # Store type distribution as JSON like {"Pump": 3, "Valve": 2}
    type_distribution = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.filename} ({self.uploaded_at})"


class EquipmentRecord(models.Model):
    dataset = models.ForeignKey(
        DatasetUpload,
        on_delete=models.CASCADE,
        related_name="records"
    )

    equipment_name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)

    flowrate = models.FloatField()
    pressure = models.FloatField()
    temperature = models.FloatField()

    def __str__(self):
        return self.equipment_name
