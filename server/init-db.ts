import { pool, db } from './db';
import { pastes } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function initializeDatabase() {
  console.log('Creating database schema...');
  
  try {
    // Create the pastes table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pastes (
        id SERIAL PRIMARY KEY,
        paste_id TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        language TEXT NOT NULL,
        author_name TEXT,
        views INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,
        tags TEXT[]
      )
    `);
    
    console.log('Database schema created successfully');
    
    // Check if any pastes exist
    const existingPastes = await db.select().from(pastes).limit(1);
    
    if (existingPastes.length === 0) {
      console.log('Creating initial pastes...');
      
      // Add some example pastes
      await db.insert(pastes).values([
        {
          pasteId: 'js_example',
          title: 'JavaScript Promise Example',
          content: `function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = { name: 'John', age: 30 };
      resolve(data);
    }, 1000);
  });
}

async function main() {
  try {
    const result = await fetchData();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();`,
          language: 'javascript',
          authorName: 'CodeSnap Team',
          views: 42,
          createdAt: new Date(),
          tags: ['javascript', 'async', 'promises']
        },
        {
          pasteId: 'py_example',
          title: 'Python Class Example',
          content: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def greet(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old."
        
    @classmethod
    def from_birth_year(cls, name, birth_year):
        age = 2023 - birth_year
        return cls(name, age)
        
# Create a new Person instance
person = Person("Alice", 30)
print(person.greet())

# Use the class method
person2 = Person.from_birth_year("Bob", 1990)
print(person2.greet())`,
          language: 'python',
          authorName: 'CodeSnap Team',
          views: 27,
          createdAt: new Date(),
          tags: ['python', 'oop', 'classes']
        }
      ]);
      
      console.log('Initial pastes created successfully');
    }
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the initialization function
initializeDatabase()
  .then(() => console.log('Database initialization complete'))
  .catch(err => console.error('Database initialization failed:', err))
  .finally(() => process.exit());