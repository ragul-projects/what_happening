import { nanoid } from "nanoid";
import * as schema from "@shared/schema";
import { pastes, type Paste, type InsertPaste } from "@shared/schema";
import { add } from "date-fns";
import { db } from "./db";
import { eq, asc, desc, ne, isNotNull, isNull, and, or, sql, gt } from "drizzle-orm";

export interface IStorage {
  createPaste(paste: Omit<Paste, "id" | "views" | "createdAt"> & { pasteId: string }): Promise<Paste>;
  getPasteById(id: number): Promise<Paste | undefined>;
  getPasteByPasteId(pasteId: string): Promise<Paste | undefined>;
  incrementViews(id: number): Promise<void>;
  getRecentPastes(limit?: number): Promise<Paste[]>;
  getRelatedPastes(language: string, excludeId?: number, limit?: number): Promise<Paste[]>;
  deletePaste(id: number): Promise<void>;
  updatePaste(id: number, content: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createPaste(pasteData: Omit<Paste, "id" | "views" | "createdAt"> & { pasteId: string }): Promise<Paste> {
    try {
      // Use the drizzle ORM to insert the record
      const inserted = await db.insert(pastes).values({
        pasteId: pasteData.pasteId,
        title: pasteData.title || "Untitled",
        content: pasteData.content,
        language: pasteData.language || "plaintext",
        expiresAt: pasteData.expiresAt,
        authorName: pasteData.authorName || "Anonymous",
        isFile: pasteData.isFile || false,
        fileName: pasteData.fileName || null,
        fileType: pasteData.fileType || null,
        tags: pasteData.tags || []
      }).returning();
      
      if (!inserted || inserted.length === 0) {
        throw new Error("Failed to create paste: No rows returned");
      }
      
      return inserted[0];
    } catch (error) {
      console.error("Error in createPaste:", error);
      throw error;
    }
  }

  async getPasteById(id: number): Promise<Paste | undefined> {
    const currentDate = new Date();
    
    try {
      const paste = await db.query.pastes.findFirst({
        where: and(
          eq(schema.pastes.id, id),
          or(
            isNull(schema.pastes.expiresAt),
            gt(schema.pastes.expiresAt, currentDate)
          )
        )
      });
      
      return paste || undefined;
    } catch (error) {
      console.error("[storage] Error in getPasteById:", error);
      return undefined;
    }
  }

  async getPasteByPasteId(pasteId: string): Promise<Paste | undefined> {
    const currentDate = new Date();
    
    try {
      const paste = await db.query.pastes.findFirst({
        where: and(
          eq(schema.pastes.pasteId, pasteId),
          or(
            isNull(schema.pastes.expiresAt),
            gt(schema.pastes.expiresAt, currentDate)
          )
        )
      });
      
      return paste || undefined;
    } catch (error) {
      console.error("[storage] Error in getPasteByPasteId:", error);
      return undefined;
    }
  }

  async incrementViews(id: number): Promise<void> {
    try {
      await db.update(schema.pastes)
        .set({ views: sql`views + 1` })
        .where(eq(schema.pastes.id, id));
    } catch (error) {
      console.error("[storage] Error in incrementViews:", error);
    }
  }

  async getRecentPastes(limit?: number): Promise<Paste[]> {
    const currentDate = new Date();
    
    try {
      // Use Drizzle ORM to fetch the data
      // Create query options
      const queryOptions: any = {
        where: or(
          isNull(schema.pastes.expiresAt),
          gt(schema.pastes.expiresAt, currentDate)
        ),
        orderBy: [desc(schema.pastes.createdAt)]
      };
      
      // Only add limit if provided
      if (limit !== undefined) {
        queryOptions.limit = limit;
      }
      
      const pastes = await db.query.pastes.findMany(queryOptions);
      
      console.log("[storage] Successfully fetched recent pastes:", pastes.length);
      return pastes;
    } catch (error) {
      console.error("[storage] Error in getRecentPastes:", error);
      // Return empty array to avoid breaking the application
      return [];
    }
  }

  async getRelatedPastes(language: string, excludeId?: number, limit: number = 3): Promise<Paste[]> {
    const currentDate = new Date();
    
    try {
      // Use Drizzle ORM to fetch the data
      const whereConditions = [
        eq(schema.pastes.language, language),
        or(
          isNull(schema.pastes.expiresAt),
          gt(schema.pastes.expiresAt, currentDate)
        )
      ];
      
      // Add excludeId condition if provided
      if (excludeId !== undefined) {
        whereConditions.push(ne(schema.pastes.id, excludeId));
      }
      
      const relatedPastes = await db.query.pastes.findMany({
        where: and(...whereConditions),
        orderBy: [desc(schema.pastes.views)],
        limit: limit,
      });
      
      console.log("[storage] Successfully fetched related pastes:", relatedPastes.length);
      return relatedPastes;
    } catch (error) {
      console.error("[storage] Error in getRelatedPastes:", error);
      return [];
    }
  }

  async deletePaste(id: number): Promise<void> {
    try {
      await db.delete(schema.pastes)
        .where(eq(schema.pastes.id, id));
    } catch (error) {
      console.error("[storage] Error in deletePaste:", error);
    }
  }

  async updatePaste(id: number, content: string): Promise<boolean> {
    try {
      const result = await db.update(schema.pastes)
        .set({ content })
        .where(eq(schema.pastes.id, id))
        .returning({ id: schema.pastes.id });
      
      return result.length > 0;
    } catch (error) {
      console.error("[storage] Error in updatePaste:", error);
      return false;
    }
  }

  async createInitialPastes() {
    // Python example
    const pythonPaste = {
      pasteId: nanoid(8),
      title: "Python DataFrame Operations",
      content: `import pandas as pd
import numpy as np

# Create a sample DataFrame
data = {
    'Name': ['John', 'Anna', 'Peter', 'Linda'],
    'Age': [28, 34, 29, 42],
    'City': ['New York', 'Paris', 'Berlin', 'London']
}

df = pd.DataFrame(data)
print(df.head())

# Basic operations
print("Mean age:", df['Age'].mean())
print("Oldest person:", df.loc[df['Age'].idxmax()])

# Filtering
adults = df[df['Age'] > 30]
print("Adults:")
print(adults)

# Grouping
by_city = df.groupby('City').mean()
print("Average age by city:")
print(by_city)`,
      language: "python",
      authorName: "DataAnalyst",
      isFile: false,
      fileName: null,
      fileType: null,
      tags: ["python", "pandas", "data-analysis"],
      expiresAt: add(new Date(), { days: 30 }),
    };
    
    // JavaScript example
    const jsPaste = {
      pasteId: nanoid(8),
      title: "JavaScript Array Methods",
      content: `// Common JavaScript Array Methods

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Map: Transform each element
const doubled = numbers.map(num => num * 2);
console.log('Doubled:', doubled);

// Filter: Keep elements that pass a test
const evens = numbers.filter(num => num % 2 === 0);
console.log('Even numbers:', evens);

// Reduce: Accumulate values
const sum = numbers.reduce((total, num) => total + num, 0);
console.log('Sum:', sum);

// Find: Get first element that matches
const firstBigNumber = numbers.find(num => num > 5);
console.log('First number > 5:', firstBigNumber);

// Some: Check if at least one element passes a test
const hasEven = numbers.some(num => num % 2 === 0);
console.log('Has even numbers:', hasEven);

// Every: Check if all elements pass a test
const allPositive = numbers.every(num => num > 0);
console.log('All positive:', allPositive);`,
      language: "javascript",
      authorName: "JSdev",
      isFile: false,
      fileName: null,
      fileType: null,
      tags: ["javascript", "arrays", "functions"],
      expiresAt: add(new Date(), { days: 30 }),
    };
    
    // Python ML example
    const pythonMLPaste = {
      pasteId: nanoid(8),
      title: "Machine Learning with scikit-learn",
      content: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# Load dataset (using Iris as an example)
from sklearn.datasets import load_iris
iris = load_iris()
X = iris.data
y = iris.target

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train a Random Forest model
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train_scaled, y_train)

# Make predictions
y_pred = clf.predict(X_test_scaled)

# Evaluate the model
print("Classification Report:")
print(classification_report(y_test, y_pred, target_names=iris.target_names))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Feature importance
feature_importances = clf.feature_importances_
for i, importance in enumerate(feature_importances):
    print(f"Feature {iris.feature_names[i]}: {importance:.4f}")`,
      language: "python",
      authorName: "MLEngineer",
      isFile: false,
      fileName: null,
      fileType: null,
      tags: ["python", "machine-learning", "scikit-learn", "random-forest"],
      expiresAt: add(new Date(), { days: 30 }),
    };
    
    // Data Visualization example
    const vizPaste = {
      pasteId: nanoid(8),
      title: "Data Visualization with matplotlib",
      content: `import matplotlib.pyplot as plt
import numpy as np

# Generate some sample data
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)
y3 = np.exp(-x/5) * np.sin(x)

# Create a figure with subplots
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))

# First subplot
ax1.plot(x, y1, 'b-', label='sin(x)')
ax1.plot(x, y2, 'r-', label='cos(x)')
ax1.set_xlabel('x')
ax1.set_ylabel('y')
ax1.set_title('Sine and Cosine Functions')
ax1.grid(True)
ax1.legend()

# Second subplot
ax2.plot(x, y3, 'g-', label='exp(-x/5) * sin(x)')
ax2.set_xlabel('x')
ax2.set_ylabel('y')
ax2.set_title('Damped Sine Function')
ax2.grid(True)
ax2.legend()

# Adjust layout
plt.tight_layout()

# Example of a bar chart
categories = ['A', 'B', 'C', 'D', 'E']
values = [5, 7, 3, 8, 6]

plt.figure(figsize=(8, 6))
plt.bar(categories, values, color='skyblue')
plt.xlabel('Categories')
plt.ylabel('Values')
plt.title('Simple Bar Chart')
plt.grid(True, axis='y', linestyle='--', alpha=0.7)

# Show the plots
plt.show()`,
      language: "python",
      authorName: "DataViz",
      isFile: false,
      fileName: null,
      fileType: null,
      tags: ["python", "matplotlib", "data-visualization", "charts"],
      expiresAt: add(new Date(), { days: 30 }),
    };
    
    // Python pandas transport example (similar to screenshot)
    const transportPaste = {
      pasteId: nanoid(8),
      title: "Top Transport pandas in python",
      content: `import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.model_selection import KFold, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

file_path = "time_series_examples.csv"
df_temp = pd.read_csv(file_path)
df_long = df_temp.melt(id_vars=["Name"], var_name="Season")
X_orig = df_long[["Season"]]
y_pred = df_long["value"]
scaler = StandardScaler()
le = LabelEncoder().fit(X_orig.Season)
X_encoded = le.transform(X_orig.Season)
model = LogisticRegression(max_iter=1000)
cv = KFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X_encoded.reshape(-1, 1), y_pred, scoring='accuracy')
mean_accuracy = cv_scores.mean()
std_accuracy = cv_scores.std()
model.fit(X_encoded.reshape(-1,1), y_pred)
y_pred = model.predict(X_encoded.reshape(-1, 1))
conf_matrix = confusion_matrix(y_pred, y_pred, output_dict=True)
print(f"Accuracy: {mean_accuracy:.2f}")`,
      language: "python",
      authorName: "Anonymous",
      isFile: false,
      fileName: null,
      fileType: null,
      tags: ["python", "pandas", "transportation", "logistic-regression"],
      views: 147,
      expiresAt: null,
    };
    
    await this.createPaste(pythonPaste);
    await this.createPaste(jsPaste);
    await this.createPaste(pythonMLPaste);
    await this.createPaste(vizPaste);
    await this.createPaste(transportPaste);
  }
}

// Initialize the storage
export const storage = new DatabaseStorage();
