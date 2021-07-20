export default class CustomMap<K, V> extends Map<K, V> {
    constructor() { super(); };

    array() {
        return Array.from(this, ([_, value]) => value);
    }

    toJSON() {
        return Array.from(this, ([name, val]) => ({ name, value: val }));
    }

    push(key: K, data: V) {
        const hasil = this.get(key);
        if (hasil && Array.isArray(hasil)) {
            hasil.push(data);
            return (this.get(key) as unknown as V[]).length;
        } else {
            return undefined;
        }
    }

    ensure(key: K, val: V) {
        if (!this.has(key)) {
            this.set(key, val);
        }
    }
}