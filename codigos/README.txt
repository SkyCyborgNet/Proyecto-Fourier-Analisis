proyecto_ml_2025/
│
├── README.md                          # Descripción completa del proyecto
├── requirements.txt                   # Bibliotecas necesarias
├── main.py                            # Orquestador principal
├── config.py                          # Configuraciones globales
├── .env.example                       # Variables de entorno (ejemplo)
│
├── data/                              # Datos del proyecto
│   ├── raw/                           # Datos "crudos" (los generaremos)
│   │   └── dataset_raw.csv
│   ├── processed/                     # Datos preprocesados
│   │   └── dataset_clean.csv
│   ├── splits/                        # Divisiones train/test/val
│   │   ├── X_train.csv
│   │   ├── X_test.csv
│   │   ├── y_train.csv
│   │   └── y_test.csv
│   └── outputs/                       # Resultados generados
│       ├── modelos/                   # Modelos guardados (.pkl)
│       ├── graficos/                  # Visualizaciones
│       ├── metricas/                  # Métricas en CSV/JSON
│       └── reportes/                  # Reportes finales
│
├── src/                               # Código fuente modular
│   ├── __init__.py
│   ├── data_generator.py              # Generación de datos sintéticos
│   ├── data_loader.py                 # Carga y validación de datos
│   ├── preprocessing.py               # Limpieza, encoding, escalado
│   ├── exploratory_analysis.py        # EDA completo
│   ├── feature_engineering.py         # Creación de features
│   ├── model_training.py              # Entrenamiento de modelos
│   ├── model_evaluation.py            # Evaluación y métricas
│   ├── hyperparameter_tuning.py       # Optimización de hiperparámetros
│   ├── visualization.py               # Generación de gráficos
│   └── report_generator.py            # Generación de reportes
│
├── notebooks/                         # Jupyter notebooks (opcional)
│   └── exploratory_analysis.ipynb
│
├── tests/                             # Pruebas unitarias
│   ├── __init__.py
│   ├── test_preprocessing.py
│   └── test_model_training.py
│
├── utils/                             # Utilidades
│   ├── __init__.py
│   ├── helpers.py                     # Funciones auxiliares
│   ├── validators.py                  # Validaciones
│   └── logger.py                      # Configuración de logging
│
└── logs/                              # Logs de ejecución
    └── proyecto_ml.log