# atmemo

decorator for getter lazy evaluation

## Example

```typescript
import memo from 'atmemo'

class MyModule {
  @memo get field() {
    return {}
  }
}

const mod = new MyModule()
assert(mod.field === mod.field)
```

## License

MIT
