export interface StoredScript {
  id: string;
  name: string;
  code: string;
  lastModified: number;
}

const DB_NAME = 'TopBotNexusDB';
const STORE_NAME = 'python_scripts';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveScript = async (script: StoredScript): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(script);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadScripts = async (): Promise<StoredScript[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteScript = async (id: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
};

// Initialize with a demo script if empty
export const seedDatabase = async () => {
    const scripts = await loadScripts();
    if (scripts.length === 0) {
        await saveScript({
            id: 'nmap_scan',
            name: 'nmap_lite.py',
            lastModified: Date.now(),
            code: `# TopBot Nexus Network Scanner (Simulation)
import sys
import time
import random

class NmapLite:
    def __init__(self):
        self.targets = []
        print("Initializing NmapLite v1.0...")

    def scan(self, target_ip):
        print(f"Starting Nmap 7.94 scan on {target_ip} at {time.strftime('%H:%M:%S')}")
        print("Host is up (0.0024s latency).")
        print("Not shown: 996 closed tcp ports (reset)")
        
        print("\\nPORT     STATE SERVICE VERSION")
        
        # Simulate common ports based on random chance
        ports = [
            (22, "ssh", "OpenSSH 8.2p1 Ubuntu"),
            (80, "http", "nginx 1.18.0"),
            (443, "ssl/http", "nginx 1.18.0"),
            (3000, "http", "Node.js Express framework"),
            (5432, "postgresql", "PostgreSQL DB 13.4"),
            (8080, "http-proxy", "TopBot Gateway")
        ]
        
        found = 0
        for port, service, version in ports:
            # Randomize simulation
            if random.random() > 0.3:
                time.sleep(0.2) # Simulate network lag
                print(f"{port}/tcp  open  {service:<7} {version}")
                found += 1
                
        if found == 0:
            print("No open ports found (Host might be firewalled)")
            
        print(f"\\nNmap done: 1 IP address (1 host up) scanned in {1.5 + random.random():.2f} seconds")

# Main Execution
if __name__ == '__main__':
    target = "192.168.50.1"
    scanner = NmapLite()
    scanner.scan(target)
`
        });
    }
};